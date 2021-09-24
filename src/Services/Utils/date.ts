import moment from "moment"

export const convertDateFromTimestamp = (date: number, format: string) => {
  return moment.unix(date).format(format)
}