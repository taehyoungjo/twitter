export function TweetHeader({
  name,
  handle,
  timestamp,
  avatarUrl,
}: {
  name: string;
  handle: string;
  timestamp: number;
  avatarUrl: string;
}) {
  return (
    <div className="flex space-x-2">
      <img src={avatarUrl} className="w-8 h-8 rounded-full" />
      <h2 className="font-bold">{name}</h2>
      <h2 className="text-slate-500">@{handle}</h2>
      <span className="text-slate-500">
        {new Date(timestamp).toLocaleString()}
      </span>
    </div>
  );
}
