import emojiRegex from 'emoji-regex'

const regex = emojiRegex()

export function extractStartEmoji(text?: string) {
  return text?.match(regex)?.[0]
}
