import { baseApi } from './baseApi';

export const pigeonApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPigeons: builder.query({
      query: (params) => ({ url: '/pigeons', params }),
      providesTags: (result) =>
        result?.data
          ? [...result.data.map(({ id }) => ({ type: 'Pigeon', id })), { type: 'Pigeon', id: 'LIST' }]
          : [{ type: 'Pigeon', id: 'LIST' }],
    }),
    getPigeonById: builder.query({
      query: (id) => `/pigeons/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Pigeon', id }],
    }),
    createPigeon: builder.mutation({
      query: (body) => ({ url: '/pigeons', method: 'POST', body }),
      invalidatesTags: [{ type: 'Pigeon', id: 'LIST' }],
    }),
    updatePigeon: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/pigeons/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Pigeon', id }, { type: 'Pigeon', id: 'LIST' }],
    }),
    deletePigeon: builder.mutation({
      query: (id) => ({ url: `/pigeons/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Pigeon', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetPigeonsQuery,
  useGetPigeonByIdQuery,
  useCreatePigeonMutation,
  useUpdatePigeonMutation,
  useDeletePigeonMutation,
} = pigeonApi;
