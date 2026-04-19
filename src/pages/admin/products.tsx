import { useEffect, useState, type ReactElement } from "react";
import { FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import type { Column } from "react-table";
import AdminSidebar from "../../components/admin/AdminSidebar";
import TableHOC from "../../components/admin/TableHOC";
import { useAllProductsQuery } from "../../redux/api/productAPI";
import { server } from "../../redux/store";
import toast from "react-hot-toast";
import type { CustomError } from "../../types/api-types";
import { useSelector } from "react-redux";
import type { UserReducerInitialState } from "../../types/reducer-types";
import { Skeleton } from "../../components/loader";

interface DataType {
  photo: ReactElement;
  name: string;
  price: number;
  stock: number;
  action: ReactElement;
}

const columns: Column<DataType>[] = [
  {
    Header: "Photo",
    accessor: "photo",
  },
  {
    Header: "Name",
    accessor: "name",
  },
  {
    Header: "Price",
    accessor: "price",
  },
  {
    Header: "Stock",
    accessor: "stock",
  },
  {
    Header: "Action",
    accessor: "action",
  },
];


const Products = () => {
  const { user } = useSelector(
    (state: { userReducer: UserReducerInitialState }) => state.userReducer,
  );
  const userId = user?._id;
  const { isLoading, isError, error, data } = useAllProductsQuery(userId ?? "", {
    skip: !userId,
    refetchOnMountOrArgChange: true,
  });

  const [rows, setRows] = useState<DataType[]>([]);

  useEffect(() => {
    if (!isError) return;
    const err = error as CustomError;
    toast.error(err.data?.message || "Unable to fetch products");
  }, [isError, error]);

  useEffect(() => {
    if (data)
      setRows(
        data?.products.map((i) => ({
          photo: <img src={`${server}/${i.photo}`} alt={i.name} />,
          name: i.name,
          price: i.price,
          stock: i.stock,
          action: <Link to={`/admin/product/${i._id}`}>Manage</Link>,
        })),
      );
  }, [data]);

  const Table = TableHOC<DataType>(
    columns,
    rows,
    "dashboard-product-box",
    "Products",
    rows.length > 6,
  )();

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main>{isLoading ? <Skeleton length={20}/> : Table}</main>
      <Link to="/admin/product/new" className="create-product-btn">
        <FaPlus />
      </Link>
    </div>
  );
};

export default Products;
