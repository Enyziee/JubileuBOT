function timeParsed() {
    const date = new Date;
    const hour = date.getHours();
    const min = date.getMinutes();
    const sec = date.getSeconds();

    return `[${hour}:${min}:${sec}] `;
}

module.exports = { timeParsed };