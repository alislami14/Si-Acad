import DateTimePicker, { DateTimePickerProps } from './DateTimePicker';

export interface DatePickerProps extends Omit<DateTimePickerProps, 'showTime'> {}

export const DatePicker = (props: DatePickerProps) => {
  return <DateTimePicker {...props} showTime={false} />;
};

export default DatePicker;

