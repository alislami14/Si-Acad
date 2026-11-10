import { Users, Crown, Shield, User, ArrowRight, Share2, MoreVertical, Trash2, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StudyGroup } from '../../types/database';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

interface GroupCardProps {
  group: StudyGroup;
  onInvite: (group: StudyGroup) => void;
  onDelete?: (groupId: string) => void;
  onLeave?: (groupId: string) => void;
}

export const GroupCard = ({ group, onInvite, onDelete, onLeave }: GroupCardProps) => {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const members = group.members || [];
  const myMembership = members.find((m) => m.user_id === user?.id);
  const isOwner = group.owner_id === user?.id || myMembership?.role === 'owner';

  const roleConfig = {
    owner: { label: 'Ketua / Owner', icon: Crown, variant: 'sage' as const },
    admin: { label: 'Admin', icon: Shield, variant: 'warning' as const },
    member: { label: 'Anggota', icon: User, variant: 'default' as const },
  };

  return (
    <Card className="relative hover:border-[#7C9A76] transition-all flex flex-col justify-between" padding="md">
      <div>
        {/* Top header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#E6EDE5] dark:bg-[#202C20] flex items-center justify-center text-[#4D6449] dark:text-[#A8C5A0] shrink-0 font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-heading font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {group.name}
              </h3>
              {myMembership && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#627F5C] dark:text-[#93AC91] mt-0.5">
                  {myMembership.role === 'owner' && <Crown className="w-3 h-3 text-amber-500" />}
                  {myMembership.role === 'admin' && <Shield className="w-3 h-3 text-[#7C9A76]" />}
                  {roleConfig[myMembership.role]?.label || 'Anggota'}
                </span>
              )}
            </div>
          </div>

          {/* Menu button */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#1E251E] rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 py-1 z-20 text-xs">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onInvite(group);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#253023]"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#7C9A76]" />
                    <span>Undang Anggota</span>
                  </button>
                  {isOwner && onDelete ? (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(group.id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Kelompok</span>
                    </button>
                  ) : onLeave ? (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onLeave(group.id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar Kelompok</span>
                    </button>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        {group.description && (
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 line-clamp-2 leading-relaxed">
            {group.description}
          </p>
        )}

        {/* Members avatar list */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex -space-x-2 overflow-hidden">
              {members.slice(0, 4).map((m) => (
                <div
                  key={m.id}
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-[#1E251E] bg-[#D0DDD0] dark:bg-[#2D3B2D] text-[#334230] dark:text-[#E6EDE5] flex items-center justify-center text-[10px] font-bold"
                  title={m.profile?.full_name || 'Anggota'}
                >
                  {m.profile?.full_name ? m.profile.full_name[0].toUpperCase() : 'U'}
                </div>
              ))}
            </div>
            {members.length > 4 && (
              <span className="ml-2 text-[11px] font-semibold text-gray-500">
                +{members.length - 4} lainnya
              </span>
            )}
          </div>

          <span className="text-xs font-medium text-gray-500">
            {members.length} Anggota
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 flex items-center gap-2">
        <button
          onClick={() => onInvite(group)}
          className="flex-1 px-3 py-1.5 rounded-xl border border-[#D0DDD0] dark:border-[#334230] text-xs font-semibold text-[#4D6449] dark:text-[#A8C5A0] hover:bg-[#E6EDE5]/50 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Undang</span>
        </button>

        <Link
          to={`/groups/${group.id}`}
          className="flex-1 px-3 py-1.5 rounded-xl bg-[#7C9A76] hover:bg-[#688562] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
        >
          <span>Buka Dasbor</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
};

export default GroupCard;

