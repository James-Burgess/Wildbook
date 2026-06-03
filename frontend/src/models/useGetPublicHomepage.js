import queryKeys from "../constants/queryKeys";
import useFetch from "../hooks/useFetch";

export default function useGetPublicHomepage() {
	return useFetch({
		queryKey: queryKeys.publicHomepage,
		url: "/public/homepage",
		queryOptions: { retry: false },
	});
}
