module.exports = function log(message, logType) {
    var final = `=== Bot Log ===\n\n${message}\n\n===============`
    logType = logType.toLocaleLowerCase
    if (logType === "error")
        console.error(final)
    else if (logType === "warn")
        console.warn(final)
    else
        console.log(final)
}