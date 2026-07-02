declare module 'sentiment' {
  class Sentiment {
    analyze(text: string): {
      score: number
      comparative: number
      calculation: any[]
      tokens: string[]
      words: string[]
      positive: string[]
      negative: string[]
    }
  }
  export = Sentiment
}