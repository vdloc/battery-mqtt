import { trpc } from "../utils/trpc"

const HomePage = () => {
  const deviceIntervals = trpc.requestInterval.useQuery({ imei: "351669057683473" })
  return (
    <div>
      <h1>Home</h1>
      {deviceIntervals.data}
    </div>
  )
}
export default HomePage
