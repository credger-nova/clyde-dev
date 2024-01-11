export function toTitleCase(text: string): string {
    const newText = text.split(" ")
        .map(w => w[0].toUpperCase() + w.substring(1).toLowerCase())
        .join(" ")

    return newText
}