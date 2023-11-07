export function formatDate(dateString: string): string {
  const date: Date = new Date(dateString)
  const yyyy: string = (date.getFullYear()).toString()
  let mm: string = (date.getMonth() + 1).toString()
  let dd: string = (date.getDate()).toString()

  if (parseInt(dd) < 10) {
    dd = '0' + dd
  }

  if (parseInt(mm) < 10) {
    mm = '0' + mm
  }

  return dd + '/' + mm + '/' + yyyy
}
