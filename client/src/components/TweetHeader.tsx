export function TweetHeader({
  name,
  handle,
  timestamp,
}: {
  name: string;
  handle: string;
  timestamp: number;
}) {
  return (
    <div className="flex space-x-2">
      <div className="bg-slate-300 rounded-full w-8 h-8"></div>
      <h2 className="font-bold">{name}</h2>
      <h2 className="text-slate-500">@{handle}</h2>
      <span className="text-slate-500">
        {new Date(timestamp).toLocaleString()}
      </span>
    </div>
  );
}
