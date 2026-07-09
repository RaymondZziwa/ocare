// import { apiRequest } from "@/libs/apiConfig";
// import {
//   fetchDataFailure,
//   fetchDataStart,
//   fetchDataSuccess,
// } from "@/redux/slices/bannerSlice";
// import type { RootState } from "@/redux/store";
// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";

// const useBanners = () => {
//   const dispatch = useDispatch();

//   const fetchDataFromApi = async () => {
//     dispatch(fetchDataStart());

//     try {
//       const response = await apiRequest("/banners/active", "GET", "");
//       if (response.status === 200) {
//         dispatch(fetchDataSuccess(response.data));
//       } else {
//         throw new Error("Failed to fetch banners.");
//       }
//     } catch (error) {
//       console.error("Failed to fetch banners:", error);
//       dispatch(
//         fetchDataFailure(
//           error instanceof Error ? error.message : "An unknown error occurred.",
//         ),
//       );
//     }
//   };

//   useEffect(() => {
//     fetchDataFromApi();
//   }, []);

//   const data = useSelector((state: RootState) => state.banner);

//   return { ...data, refresh: fetchDataFromApi };
// };

// export default useBanners;
