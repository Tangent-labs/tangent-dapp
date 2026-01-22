export const returnTVLType = (type: string) => {
  switch (type) {
    case "markets":
      return "bg-row-tonic"
    case "pegkeepers":
      return "bg-row-danger"
    case "wts":
      return "bg-row-success"
    case "susg":
      return "bg-row-warning"
  }
}
