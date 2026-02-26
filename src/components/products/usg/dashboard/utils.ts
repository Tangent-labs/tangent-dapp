export const returnTVLType = (type: string) => {
  switch (type) {
    case "markets":
      return "bg-row-tonic"
    case "pegkeepers":
      return "bg-dash-keepers"
    case "wts":
      return "bg-dash-wts"
    case "susg":
      return "bg-dash-susg"
  }
}
