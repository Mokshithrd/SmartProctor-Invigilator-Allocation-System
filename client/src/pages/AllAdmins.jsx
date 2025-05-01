
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdmins } from "../redux/slices/adminSlice";

const AllAdmins = () => {
  const dispatch = useDispatch();
  const { admins, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdmins());
  }, [dispatch]);

  return (
    <div>
      <h2>All Admins</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {admins.map((admin, idx) => (
          <li key={idx}>{admin.name || admin.email || "Unnamed Admin"}</li>
        ))}
      </ul>
    </div>
  );
};

export default AllAdmins;
