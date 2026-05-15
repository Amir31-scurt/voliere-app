import { baseApi } from './baseApi';

export const coupleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCouples: builder.query({
      query: (params) => ({ url: '/couples', params }),
      providesTags: (result) =>
        result?.data
          ? [...result.data.map(({ id }) => ({ type: 'Couple', id })), { type: 'Couple', id: 'LIST' }]
          : [{ type: 'Couple', id: 'LIST' }],
    }),
    getCoupleById: builder.query({
      query: (id) => `/couples/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Couple', id }],
    }),
    createCouple: builder.mutation({
      query: (body) => ({ url: '/couples', method: 'POST', body }),
      invalidatesTags: [{ type: 'Couple', id: 'LIST' }, { type: 'Pigeon', id: 'LIST' }, { type: 'Cage', id: 'LIST' }],
    }),
    separerCouple: builder.mutation({
      query: (id) => ({ url: `/couples/${id}/separer`, method: 'PUT' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Couple', id },
        { type: 'Couple', id: 'LIST' },
        { type: 'Pigeon', id: 'LIST' },
        { type: 'Cage', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetCouplesQuery,
  useGetCoupleByIdQuery,
  useCreateCoupleMutation,
  useSeparerCoupleMutation,
} = coupleApi;
