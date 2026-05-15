import { baseApi } from './baseApi';

export const reproductionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReproductions: builder.query({
      query: (params) => ({ url: '/reproductions', params }),
      providesTags: ['Reproduction'],
    }),
    createReproduction: builder.mutation({
      query: (body) => ({ url: '/reproductions', method: 'POST', body }),
      invalidatesTags: ['Reproduction', 'Cage', 'Couple'],
    }),
    updateReproduction: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/reproductions/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Reproduction', 'Cage', 'Couple'],
    }),
  }),
});

export const {
  useGetReproductionsQuery,
  useCreateReproductionMutation,
  useUpdateReproductionMutation,
} = reproductionApi;
