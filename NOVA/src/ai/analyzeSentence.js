export async function analyzeSentence(sentence) {
  const normalized = sentence?.trim() ?? ''

  return {
    normalized,
    tone: 'neutral',
    keywords: normalized ? normalized.split(' ') : [],
  }
}





