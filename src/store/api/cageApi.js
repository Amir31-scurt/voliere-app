import { baseApi } from './baseApi';

export const cageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCages: builder.query({
      query: (voliere) => `/cages?voliere=${voliere ?? ''}`,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Cage', id })), { type: 'Cage', id: 'LIST' }]
          : [{ type: 'Cage', id: 'LIST' }],
    }),
    getCageById: builder.query({
      query: (id) => `/cages/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Cage', id }],
    }),
    getCageHistorique: builder.query({
      query: (id) => `/cages/${id}/historique`,
      providesTags: (_r, _e, id) => [{ type: 'Historique', id }],
    }),
    createCage: builder.mutation({
      query: (body) => ({ url: '/cages', method: 'POST', body }),
      invalidatesTags: [{ type: 'Cage', id: 'LIST' }],
    }),
    updateCage: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/cages/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Cage', id }, { type: 'Cage', id: 'LIST' }],
    }),
    deleteCage: builder.mutation({
      query: (id) => ({ url: `/cages/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Cage', id: 'LIST' }],
    }),
    affecterCage: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/cages/${id}/affecter`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Cage', id },
        { type: 'Cage', id: 'LIST' },
        'Pigeon',
        'Couple',
      ],
    }),
    libererCage: builder.mutation({
      query: (id) => ({ url: `/cages/${id}/liberer`, method: 'PUT' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Cage', id },
        { type: 'Cage', id: 'LIST' },
        'Pigeon',
        'Couple',
      ],
    }),
  }),
});

export const {
  useGetCagesQuery,
  useGetCageByIdQuery,
  useGetCageHistoriqueQuery,
  useCreateCageMutation,
  useUpdateCageMutation,
  useDeleteCageMutation,
  useAffecterCageMutation,
  useLibererCageMutation,
} = cageApi;
