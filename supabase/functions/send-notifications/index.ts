// Supabase Edge Function: send-notifications
// Triggered by pg_cron or HTTP webhook to dispatch pending notification jobs via Web Push

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import webpush from "https://esm.sh/web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@si-acad.local";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Configure web-push
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    // 1. Claim up to 50 pending due jobs using atomic select + update
    const now = new Date().toISOString();
    const { data: jobs, error: fetchErr } = await supabase
      .from("notification_jobs")
      .select("*, user_id")
      .eq("status", "pending")
      .lte("scheduled_at", now)
      .order("scheduled_at", { ascending: true })
      .limit(50);

    if (fetchErr || !jobs || jobs.length === 0) {
      return new Response(JSON.stringify({ message: "No pending jobs to process", processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sentCount = 0;

    for (const job of jobs) {
      // Mark as processing
      await supabase
        .from("notification_jobs")
        .update({ status: "processing" })
        .eq("id", job.id);

      // Get user subscriptions
      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", job.user_id);

      const payload = JSON.stringify({
        title: job.title,
        body: job.body,
        notification_type: job.notification_type,
        action_url: job.action_url,
        id: job.id,
      });

      let delivered = false;

      if (subs && subs.length > 0) {
        for (const sub of subs) {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh,
                  auth: sub.auth,
                },
              },
              payload
            );
            delivered = true;
          } catch (pushErr: any) {
            console.error(`Push failed for sub ${sub.id}:`, pushErr);
            // If subscription is expired (410 or 404), clean up
            if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
              await supabase.from("push_subscriptions").delete().eq("id", sub.id);
            }
          }
        }
      }

      // Record in notification_logs
      await supabase.from("notification_logs").insert({
        job_id: job.id,
        user_id: job.user_id,
        notification_type: job.notification_type,
        title: job.title,
        body: job.body,
        status: delivered ? "delivered" : "failed",
        action_url: job.action_url,
      });

      // Update job to sent
      await supabase
        .from("notification_jobs")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      sentCount++;
    }

    return new Response(JSON.stringify({ success: true, processed: sentCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

