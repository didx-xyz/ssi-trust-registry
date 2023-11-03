import Image from 'next/image'

export default function Home() {
  return (
    <div className="container">
      <div className="flex justify-between">
        <h1 className="text-5xl font-bold">Trusted Entities</h1>
        <button className="btn">invite a company</button>
      </div>
        <div className="overflow-x-auto">
            <table className="table">
                <thead>
                    <tr>
                        <th>Company name</th>
                        <th>State</th>
                        <th>Updated</th>
                        <th>Registered</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Absa</td>
                        <td>Active</td>
                        <td>03/02/2023</td>
                        <td>12/06/2023</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
  )
}
