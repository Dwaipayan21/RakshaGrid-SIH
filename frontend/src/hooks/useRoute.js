import { useEffect, useState } from "react";

const useRoute = (start, end) => {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // No route initially
    // Also clears the previous route when shelter is deselected
    if (!start || !end) {
      setRoute(null);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();

    const fetchRoute = async () => {
      try {
        setLoading(true);
        setError(null);
        setRoute(null);

        /*
          Leaflet:
          [latitude, longitude]

          OSRM:
          longitude,latitude
        */

        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${start[1]},${start[0]};` +
          `${end[1]},${end[0]}` +
          `?overview=full&geometries=geojson`;

        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch route");
        }

        const data = await response.json();

        if (data.code !== "Ok" || !data.routes?.length) {
          throw new Error("No route found");
        }

        setRoute(data.routes[0]);
      } catch (err) {
        // Ignore aborted requests
        if (err.name === "AbortError") {
          return;
        }

        console.error("OSRM error:", err);
        setError(err.message);
        setRoute(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchRoute();

    // Cancel previous request when start/end changes
    return () => {
      controller.abort();
    };
  }, [start, end]);

  return {
    route,
    loading,
    error,
  };
};

export default useRoute;