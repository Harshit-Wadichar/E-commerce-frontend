import { MyntraCarousel, Slider, useRating } from "6pp";
import type { CarouselButtonType } from "6pp";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaStar, FaTrash } from "react-icons/fa";
import { FaArrowLeftLong, FaArrowRightLong, FaRegStar } from "react-icons/fa6";
import { TfiWrite } from "react-icons/tfi";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux/es/hooks/useDispatch";
import { Navigate, useParams } from "react-router-dom";
import { Skeleton } from "../components/loader";
import {
  useDeleteReviewMutation,
  useGetReviewsQuery,
  useNewReviewMutation,
  useProductDetailsQuery,
} from "../redux/api/productAPI";
import { addToCart } from "../redux/reducer/cartReducer";
import type { RootState } from "../redux/store";
import type { CartItem, Reviews } from "../types/types";
import { responseToast } from "../utils/features";
import RatingsComponent from "./admin/ratings";

function ProductDetails() {
  const params = useParams();
  const dispatch = useDispatch();

  const { user } = useSelector((state: RootState) => state.userReducer);

  const { isLoading, isError, data } = useProductDetailsQuery(
    params.id!,
  );
  const reviewsResponse = useGetReviewsQuery(params.id!);
  const [carouselOpen, setCarouselOpen] = useState(false);

  console.log(carouselOpen);

  const [quantity, setQuantity] = useState(1);
  const [reviewComment, setReviewComment] = useState("");
  const reviewDialogRef = useRef<HTMLDialogElement>(null);
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);

  const [createReview] = useNewReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();

  const decrement = () => {
    if (0 >= quantity) return toast.error("can't go to minus");
    setQuantity((prev) => prev - 1);
  };

  const increment = () => {
    if (data?.product?.stock === quantity)
      return toast.error(`only ${data?.product?.stock} items in stock`);

    setQuantity((prev) => prev + 1);
  };

  const addToCartHandler = (cartItem: CartItem) => {
    if (cartItem.stock < 1) return toast.error("out of stock bro");

    dispatch(addToCart(cartItem));

    toast.success("item added to cart");
  };

  if (isError) return <Navigate to="/404" />;

  const showDialog = () => {
    reviewDialogRef.current?.showModal();
  };

  const {
    Ratings: RatingsEditable,
    rating,
    setRating,
  } = useRating({
    IconFilled: <FaStar />,
    IconOutline: <FaRegStar />,
    value: 0,
    selectable: true,
    styles: {
      fontSize: "1.75rem",
      color: "coral",
      justifyContent: "flex-start",
    },
  });

  const reviewCloseHandler = () => {
    reviewDialogRef.current?.close();

    setRating(0);
    setReviewComment("");
  };

  const submitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setReviewSubmitLoading(true);
    reviewDialogRef.current?.close();

    const reviewData = {
      rating,
      comment: reviewComment,
    };

    const res = await createReview({
      ...reviewData,
      productId: params.id!,
      userId: user?._id!,
    });

    setReviewSubmitLoading(false);
    responseToast(res, null, "");

    setRating(0);
    setReviewComment("");
  };

  const handlerDeleteReview = async (reviewId: string) => {
    const res = await deleteReview({
      userId: user?._id,
      reviewId,
    });
    responseToast(res, null, "Review Deleted");
  };

  return (
    <div className="product-details">
      {isLoading ? (
        <ProductLoader />
      ) : (
        <main>
          <section>
            <Slider
              showThumbnails
              showNav={false}
              onClick={() => setCarouselOpen(true)}
              images={data?.product?.photos.map((i) => i.url) || []}
            />
            {carouselOpen && (
              <MyntraCarousel
                images={data?.product?.photos.map((i) => i.url) || []}
                setIsOpen={setCarouselOpen}
                PrevButton={PrevButton}
                NextButton={NextButton}
              />
            )}
          </section>
          <section>
            <code>{data?.product?.category}</code>
            <h1>{data?.product?.name}</h1>
            <em style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <RatingsComponent value={data?.product?.ratings || 0} />({" "}
              {data?.product?.numOfReviews} Reviews )
            </em>
            <h3>₹{data?.product?.price}</h3>
            <article>
              <div>
                <button onClick={decrement}>-</button>
                <span>{quantity}</span>
                <button onClick={increment}>+</button>
              </div>
              <button
                onClick={() =>
                  addToCartHandler({
                    productId: data?.product?._id!,
                    name: data?.product?.name!,
                    price: data?.product?.price!,
                    stock: data?.product?.stock!,
                    quantity,
                    photo: data?.product?.photos[0].url || "",
                  })
                }
              >
                Add To Cart
              </button>
            </article>

            <p>{data?.product?.description}</p>
          </section>
        </main>
      )}

      <dialog ref={reviewDialogRef} className="review-dialog">
        <button onClick={reviewCloseHandler}>X</button>
        <h2>Write a Review</h2>
        <form onSubmit={submitReview}>
          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Review..."
          ></textarea>
          <RatingsEditable />
          <button disabled={reviewSubmitLoading} type="submit">
            Submit
          </button>
        </form>
      </dialog>

      <section>
        <article>
          <h2>Reviews</h2>

          {reviewsResponse.isLoading ? null : user && (
            <button onClick={showDialog}>
              <TfiWrite />
            </button>
          )}
        </article>

        {reviewsResponse.isLoading ? (
          <>
            <Skeleton width="45rem" length={5} />
            <Skeleton width="45rem" length={5} />
            <Skeleton width="45rem" length={5} />
          </>
        ) : (
          reviewsResponse.data?.reviews.map((review) => (
            <ReviewCard
              handleDeleteReview={handlerDeleteReview}
              userId={user?._id}
              review={review}
              key={review._id}
            />
          ))
        )}
      </section>
    </div>
  );
}

const ReviewCard = ({
  review,
  userId,
  handleDeleteReview,
}: {
  userId?: string;
  review: Reviews;
  handleDeleteReview: (reviewId: string) => void;
}) => (
  <div key={review._id} className="review">
    <RatingsComponent value={review.rating} />
    <p>{review.comment}</p>
    <div>
      <img src={review.user.photo} alt={review.user.name} />
      <small>by {review.user.name}</small>
    </div>
    {userId === review.user._id && (
      <button onClick={()=>handleDeleteReview(review._id)}>
        <FaTrash />
      </button>
    )}
  </div>
);



const ProductLoader = () => {
  return (
    <div
      className="product-details"
      style={{
        display: "flex",
        gap: "2rem",
        border: "1px solid #f1f1f1",
        height: "80vh",
      }}
    >
      <section style={{ width: "100%", height: "100%" }}>
        <Skeleton
          width="100%"
          containerHeight="100%"
          height="100%"
          length={4}
        />
      </section>
      <section
        style={{
          width: "100%",
          border: "1px solid blue",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "4rem",
          padding: "4rem",
        }}
      >
        <Skeleton width="40%" length={3} />
        <Skeleton width="50%" length={4} />
        <Skeleton width="100%" length={4} />
        <Skeleton width="100%" length={7} />
      </section>
    </div>
  );
};

const NextButton: CarouselButtonType = ({ onClick }) => (
  <button onClick={onClick} className="carousel-btn">
    <FaArrowRightLong />
  </button>
);

const PrevButton: CarouselButtonType = ({ onClick }) => (
  <button onClick={onClick} className="carousel-btn">
    <FaArrowLeftLong />
  </button>
);

export default ProductDetails;
