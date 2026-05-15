import { baseApi } from './baseApi';

export const sortieApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSorties: builder.query({
      query: (params) => ({ url: '/sorties', params }),
      providesTags: ['Sortie'],
    }),
    createSortie: builder.mutation({
      query: (body) => ({ url: '/sorties', method: 'POST', body }),
      invalidatesTags: ['Sortie', { type: 'Pigeon', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetSortiesQuery,
  useCreateSortieMutation,
} = sortieApi;
