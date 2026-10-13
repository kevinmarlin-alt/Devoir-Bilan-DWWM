/**
 * 
 * @param {Date} date 
 */
export const toFormateDateTime = (date) => {
    const dateOptions = {
        year: "numeric",
        month: "long",
        day: "numeric"

    }
    const timeOptions = {
        hour: "numeric",
        minute: "numeric"

    }
    return `${date.toLocaleDateString('fr-FR', dateOptions)} à ${date.toLocaleTimeString('fr-FR', timeOptions)}`

}