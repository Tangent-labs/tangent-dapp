export type FormState = {
  haveToApprove: boolean
  canProcess: boolean
  cantProcessReasons: string[]
}

export type FormAction = {
  handleApprove: () => void
  handleProcess: () => void
}
