/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { optionsService, OptionsData, AddOptionPayload, DeleteOptionPayload } from "@/services/optionsService";
import { toast } from "sonner";

export function useOptions() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["options"],
    queryFn: async () => {
      const response = await optionsService.getOptions();
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const addOptionMutation = useMutation({
    mutationFn: (payload: AddOptionPayload) => optionsService.addOption(payload),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ["options"] });
      } else {
        toast.error(response.message);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add option");
    },
  });

  const deleteOptionMutation = useMutation({
    mutationFn: (payload: DeleteOptionPayload) => optionsService.deleteOption(payload),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ["options"] });
      } else {
        toast.error(response.message);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete option");
    },
  });

  // Helper to transform API data to dropdown format
  const getDropdownOptions = (category: keyof OptionsData) => {
    if (!data || !data[category]) return [];
    return data[category].map((value) => ({
      value,
      label: value,
    }));
  };

  return {
    options: data,
    isLoading,
    error,
    refetch,
    addOption: addOptionMutation.mutate,
    deleteOption: deleteOptionMutation.mutate,
    isAddingOption: addOptionMutation.isPending,
    isDeletingOption: deleteOptionMutation.isPending,
    getDropdownOptions,
  };
}
