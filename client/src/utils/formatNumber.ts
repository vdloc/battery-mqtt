export function formatNumber(num: any, minimumFractionDigits = 2) {
  num = Number(num)
  return num?.toLocaleString("en-US", {
    minimumFractionDigits: minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits,
  })
}
