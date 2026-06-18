import { InventoryEndpoints } from "@/endpoints/inventory/inventory";
import { apiRequest } from "@/libs/apiConfig";
import {
  fetchDataFailure,
  fetchDataStart,
  fetchDataSuccess,
} from "@/redux/slices/inventory/itemCategorySlice";
import type { RootState } from "@/redux/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useItemCategories = () => {
  const dispatch = useDispatch();
  //const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    //if (isFetchingLocalToken || !token?.access_token) return;

    dispatch(fetchDataStart()); // Dispatch action to indicate data fetching has started

    try {
      const response = await apiRequest(
        InventoryEndpoints.ITEM_CATEGORIES.fetch_all,
        "GET",
        "",
      );
      //console.log(response)
      if (response.status === 200) {
        console.log("subs data", response.data);
        dispatch(fetchDataSuccess(response.data)); // Dispatch action with fetched data
      } else {
        throw new Error("Failed to fetch item categories.");
      }
    } catch (error) {
      console.log(error);
      console.error("Failed to fetch item categories:", error);
      dispatch(
        fetchDataFailure(
          error instanceof Error ? error.message : "An unknown error occurred.",
        ),
      );
    }
  };

  useEffect(() => {
    fetchDataFromApi();
  }, []);

  const data = useSelector((state: RootState) => state.itemCategory);

  return { ...data, refresh: fetchDataFromApi };
};

export default useItemCategories;
