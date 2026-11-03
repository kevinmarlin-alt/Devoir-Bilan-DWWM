/**
 * 
 * Formats a date in the browser user's local time zone.
 *
 * @param {Date} date
 */
export const toFormateDateTime = (date) => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const dateOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone

    }
    const timeOptions = {
        hour: "numeric",
        minute: "numeric",
        timeZone

    }
    return `${date.toLocaleDateString(undefined, dateOptions)} à ${date.toLocaleTimeString(undefined, timeOptions)}`

}
