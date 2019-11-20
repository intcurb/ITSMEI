import { stringify } from 'qs';
import request from '@/utils/request';
import { API_HOST } from '@/utils/constants';

const getHeaders = async () => {
  const headers = {};
  const token = await localStorage.getItem('authorization');
  if (token !== null) {
    headers.Authorization = token;
  }
  return headers;
};

export async function list(entity, params) {
  return request(`${API_HOST}/${entity}?${stringify(params)}`, {
    headers: await getHeaders(),
  });
}

export async function getTotals(entity, params) {
  return request(`${API_HOST}/${entity}/totals?${stringify(params)}`, {
    headers: await getHeaders(),
  });
}

export async function getById(entity, id) {
  return request(`${API_HOST}/${entity}/${id}`, { headers: await getHeaders() });
}

export async function destroy(entity, payload) {
  return request(`${API_HOST}/${entity}/${payload.key}?${stringify(payload.query)}`, {
    method: 'DELETE',
    headers: await getHeaders(),
  });
}

export async function create(entity, data, query) {
  return request(`${API_HOST}/${entity}?${stringify(query)}`, {
    method: 'POST',
    body: data,
    headers: await getHeaders(),
  });
}

export async function update(entity, data = {}, id, query) {
  return request(`${API_HOST}/${entity}/${id}?${stringify(query)}`, {
    method: 'PUT',
    body: data,
    headers: await getHeaders(),
  });
}

export async function changeStatus(entity, data = {}, id, query = {}) {
  return request(`${API_HOST}/${entity}/${id}/status?${stringify(query)}`, {
    method: 'PUT',
    body: data,
    headers: await getHeaders(),
  });
}

export async function getFilters(entity) {
  return request(`${API_HOST}/${entity}/filters`, { headers: await getHeaders() });
}

export async function getCustomRoute(route, query = {}) {
  return request(`${API_HOST}/${route}?${stringify(query)}`, { headers: await getHeaders() });
}

export async function putCustomRoute(route, data, query = {}) {
  return request(`${API_HOST}/${route}?${stringify(query)}`, {
    method: 'PUT',
    body: data,
    headers: await getHeaders(),
  });
}

export async function postCustomRoute(route, data) {
  return request(`${API_HOST}/${route}`, {
    method: 'POST',
    body: data,
    headers: await getHeaders(),
  });
}
