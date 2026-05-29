export function isCurrentMonth(date) {
    if (!date) return false;

    const now = new Date();
    const target = new Date(date);

    return (
        target.getMonth() === now.getMonth() &&
        target.getFullYear() === now.getFullYear()
    );
}