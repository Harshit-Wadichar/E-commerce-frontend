import { Link } from "react-router-dom"
import ProductCard from "../components/product-card"

function Home() {
  const addToCartHandler=()=>{
    console.log("Added to cart")
  }
  return (
    <div className="home">
      <section>
        
      </section>
      <h1>
        Latest Products
        <Link to="/search" className="findmore">More</Link>
      </h1>

       <main>
       <ProductCard
          productId="adasdasd"
          name="Macbook"
          price={4545}
          stock={435}
          photo={"https://m.media-amazon.com/images/I/71pKJ+Mjd8L._SY450_.jpg"} 
          handler={addToCartHandler}
        />
      </main>


    </div>
  )
}

export default Home