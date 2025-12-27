interface ErrorNotificationProps {
  message: string;
}

export default function ErrorNotification({ message }: ErrorNotificationProps) {
  return (
    <div className="absolute top-5 right-5 z-10 max-w-sm px-4 py-3 rounded shadow-lg bg-red-100 border border-red-400 text-red-700">
      <span className="block sm:inline">{message}</span>
    </div>
  );
}
