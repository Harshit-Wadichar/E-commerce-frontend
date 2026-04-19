function loader() {
  return  <section className="loader">
      <div></div>
    </section>
}

export default loader;

interface SkeletonProps {
  width?: string;
  length?: number;
}

export const Skeleton = ({ width = "unset", length = 3 }: SkeletonProps) => {
  const skeletons = Array.from({ length }, (v, idx) => (
    <div key={idx} className="skeleton-shape" style={{ width }}>
      {" "}
    </div>
  ));
  return <div className="skeleton-loader">{skeletons}</div>;
};
