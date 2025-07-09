export function Clock({ time }) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return (
    <span>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </span>
  );
}