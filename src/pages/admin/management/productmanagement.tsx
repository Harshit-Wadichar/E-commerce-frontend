import { useFileHandler } from "6pp";
import { useEffect, useState, type FormEvent } from "react";
import { FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { Skeleton } from "../../../components/loader";
import {
  useDeleteProductMutation,
  useProductDetailsQuery,
  useUpdateProductMutation,
} from "../../../redux/api/productAPI";
import type { RootState } from "../../../redux/store";
import { responseToast, transformImage } from "../../../utils/features";

const Productmanagement = () => {
  const server = String(import.meta.env.VITE_SERVER ?? "").replace(/\/+$/, "");
  const { user } = useSelector((state: RootState) => state.userReducer);

  const params = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useProductDetailsQuery(params.id!);
  const product = (data?.product ?? {}) as {
    _id?: string;
    name?: string;
    price?: number;
    stock?: number;
    category?: string;
    photo?: string;
    photos?: Array<{ url?: string } | string>;
  };

  const price = product.price ?? 0;
  const photos = Array.isArray(product.photos) ? product.photos : [];
  const name = product.name ?? "";
  const stock = product.stock ?? 0;
  const category = product.category ?? "";
  const firstPhoto = photos[0];
  const previewPhotoPath =
    (typeof firstPhoto === "string" ? firstPhoto : firstPhoto?.url) ??
    product.photo ??
    "";
  const normalizedPhotoPath = previewPhotoPath.replace(/\\/g, "/");
  const rawPhotoUrl = /^https?:\/\//i.test(normalizedPhotoPath)
    ? normalizedPhotoPath
    : normalizedPhotoPath
      ? `${server}/${normalizedPhotoPath.replace(/^\/+/, "")}`
      : "";
  const previewPhotoUrl = rawPhotoUrl.includes("res.cloudinary.com")
    ? transformImage(rawPhotoUrl)
    : rawPhotoUrl;
  const isVideoPreview = /\.(mp4|webm|ogg)$/i.test(previewPhotoUrl);

  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const [priceUpdate, setPriceUpdate] = useState<number>(price);
  const [stockUpdate, setStockUpdate] = useState<number>(stock);
  const [nameUpdate, setNameUpdate] = useState<string>(name);
  const [categoryUpdate, setCategoryUpdate] = useState<string>(category);
  
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const photosFiles = useFileHandler("multiple", 10, 5);

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setBtnLoading(true);
    try {
      const formData = new FormData();

      if (nameUpdate) formData.set("name", nameUpdate);
      if (priceUpdate) formData.set("price", priceUpdate.toString());
      if (stockUpdate !== undefined)
        formData.set("stock", stockUpdate.toString());

      if (categoryUpdate) formData.set("category", categoryUpdate);

      if (photosFiles.file && photosFiles.file.length > 0) {
        formData.set("photo", photosFiles.file[0]);
      }

      const res = await updateProduct({
        formData,
        userId: user?._id!,
        productId: data?.product._id!,
      });

      responseToast(res, navigate, "/admin/product");
    } catch (error) {
      console.log(error);
    } finally {
      setBtnLoading(false);
    }
  };

  const deleteHandler = async () => {
    const res = await deleteProduct({
      userId: user?._id!,
      productId: data?.product._id!,
    });

    responseToast(res, navigate, "/admin/product");
  };

  useEffect(() => {
    if (data) {
      setNameUpdate(data.product.name);
      setPriceUpdate(data.product.price);
      setStockUpdate(data.product.stock);
      setCategoryUpdate(data.product.category);
    }
  }, [data]);

  if (isError) return <Navigate to={"/404"} />;

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="product-management">
        {isLoading ? (
          <Skeleton length={20} />
        ) : (
          <>
            <section>
              <strong>ID - {data?.product._id}</strong>
              {previewPhotoUrl ? (
                isVideoPreview ? (
                  <video
                    src={previewPhotoUrl}
                    controls
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                ) : (
                  <img src={previewPhotoUrl} alt="Product" />
                )
              ) : null}
              <p>{name}</p>
              {stock! > 0 ? (
                <span className="green">{stock} Available</span>
              ) : (
                <span className="red"> Not Available</span>
              )}
              <h3>₹{price}</h3>
            </section>
            <article>
              <button className="product-delete-btn" onClick={deleteHandler}>
                <FaTrash />
              </button>
              <form onSubmit={submitHandler}>
                <h2>Manage</h2>
                <div>
                  <label>Name</label>
                  <input
                    type="text"
                    placeholder="Name"
                    value={nameUpdate}
                    onChange={(e) => setNameUpdate(e.target.value)}
                  />
                </div>

                <div>
                  <label>Price</label>
                  <input
                    type="number"
                    placeholder="Price"
                    value={priceUpdate}
                    onChange={(e) => setPriceUpdate(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label>Stock</label>
                  <input
                    type="number"
                    placeholder="Stock"
                    value={stockUpdate}
                    onChange={(e) => setStockUpdate(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label>Category</label>
                  <input
                    type="text"
                    placeholder="eg. laptop, camera etc"
                    value={categoryUpdate}
                    onChange={(e) => setCategoryUpdate(e.target.value)}
                  />
                </div>

                <div>
                  <label>Photos</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={photosFiles.changeHandler}
                  />
                </div>

                {photosFiles.error && <p>{photosFiles.error}</p>}

                {photosFiles.preview && (
                  <div
                    style={{ display: "flex", gap: "1rem", overflowX: "auto" }}
                  >
                    {photosFiles.preview.map((img, i) => (
                      <img
                        style={{ width: 100, height: 100, objectFit: "cover" }}
                        key={i}
                        src={img}
                        alt="New Image"
                      />
                    ))}
                  </div>
                )}

                <button disabled={btnLoading} type="submit">
                  Update
                </button>
              </form>
            </article>
          </>
        )}
      </main>
    </div>
  );
};

export default Productmanagement;
