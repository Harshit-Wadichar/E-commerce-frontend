import { Link } from "react-router-dom"

function Home() {
  return (
    <div className="home">
      <section>
        
      </section>
      <h1>
        Latest Products
        <Link to="/search" className="findmore">More</Link>
      </h1>
    </div>
  )
}

export default Home