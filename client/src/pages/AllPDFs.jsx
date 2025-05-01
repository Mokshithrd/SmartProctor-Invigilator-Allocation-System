
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPDFs } from "../redux/slices/pdfSlice";

const AllPDFs = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.pdf);

  useEffect(() => {
    dispatch(fetchPDFs());
  }, [dispatch]);

  return (
    <div>
      <h2>All PDFs</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {items.map((pdf, idx) => (
          <li key={idx}>{pdf.title || pdf.name || "Untitled PDF"}</li>
        ))}
      </ul>
    </div>
  );
};

export default AllPDFs;
