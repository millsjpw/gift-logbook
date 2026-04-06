export function formatTimeAgo(date: Date | string): string {
    const now = new Date();
    const _date = new Date(date);
    const secondsAgo = Math.floor((now.getTime() - _date.getTime()) / 1000);

    const intervals: { [key: string]: number } = {
        year: 31536000,
        month: 2592000,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1
    };

    for (const [unit, value] of Object.entries(intervals)) {
        const count = Math.floor(secondsAgo / value);
        if (count >= 1) {
            return `${count} ${unit}${count > 1 ? 's' : ''} ago`;
        }
    }

    return 'just now';
}