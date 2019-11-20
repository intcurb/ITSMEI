import fetch from 'dva/fetch';
import { notification } from 'antd';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import hash from 'hash.js';
import https from 'https';

const codeMessage = {
  200: 'O servidor retornou com sucesso os dados solicitados. ',
  201: 'Dados novos ou modificados são bem sucedidos. ',
  202: 'Uma solicitação entrou na fila de segundo plano (tarefa assíncrona). ',
  204: 'Apagar dados com sucesso. ',
  400: 'A solicitação foi enviada com um erro. O servidor não executou nenhuma operação para criar ou modificar dados. ',
  401: 'O usuário não tem permissão (token, nome de usuário, senha está incorreto). ',
  403: 'O usuário está autorizado, mas o acesso é proibido. ',
  404: 'O pedido enviado é para um registro que não existe e o servidor não está operando. ',
  406: 'O formato da solicitação não está disponível. ',
  410: 'O recurso solicitado é permanentemente excluído e não será obtido novamente. ',
  422: 'Ao criar um objeto, ocorreu um erro de validação. ',
  500: 'O servidor tem um erro. Por favor, verifique o servidor. ',
  502: 'Erro de gateway. ',
  503: 'O serviço está indisponível, o servidor está temporariamente sobrecarregado ou mantido. ',
  504: 'O gateway expirou. ',
};

const checkStatus = async response => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  // special case for login
  if (response.status === 401 && new RegExp('/login').test(response.url)) {
    return response;
  }

  const resp = await response.json();

  const errorText =
    resp.message || resp.meta.message || codeMessage[response.status] || response.statusText;
  console.log(errorText);
  const error = new Error(errorText);
  error.name = response.status;

  notification.error({
    message: `${formatMessage({ id: 'app.exception.error' })} ${response.status}`,
    description: errorText,
  });

  throw error;
};

const cachedSave = (response, hashcode) => {
  /**
   * Clone a response data and store it in sessionStorage
   * Does not support data other than json, Cache only json
   */
  const contentType = response.headers.get('Content-Type');
  if (contentType && contentType.match(/application\/json/i)) {
    // All data is saved as text
    response
      .clone()
      .text()
      .then(content => {
        try {
          sessionStorage.setItem(hashcode, content);
          sessionStorage.setItem(`${hashcode}:timestamp`, Date.now());
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error);
        }
      });
  }
  return response;
};

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [option] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, option) {
  const options = {
    expirys: false,
    ...option,
  };

  /**
   * Produce fingerprints based on url and parameters
   * Maybe url has the same parameters
   */
  const fingerprint = url + (options.body ? JSON.stringify(options.body) : '');
  const hashcode = hash
    .sha256()
    .update(fingerprint)
    .digest('hex');

  const defaultOptions = {
    // credentials: 'include',
  };
  const newOptions = { ...defaultOptions, ...options };
  if (
    newOptions.method === 'POST' ||
    newOptions.method === 'PUT' ||
    newOptions.method === 'DELETE'
  ) {
    if (!(newOptions.body instanceof FormData)) {
      newOptions.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        ...newOptions.headers,
      };
      newOptions.body = JSON.stringify(newOptions.body);
    } else {
      // newOptions.body is FormData
      newOptions.headers = {
        Accept: 'application/json',
        ...newOptions.headers,
      };
    }
  }

  const expirys = options.expirys && 60;
  // options.expirys !== false, return the cache,
  if (options.expirys !== false) {
    const cached = sessionStorage.getItem(hashcode);
    const whenCached = sessionStorage.getItem(`${hashcode}:timestamp`);
    if (cached !== null && whenCached !== null) {
      const age = (Date.now() - whenCached) / 1000;
      if (age < expirys) {
        const response = new Response(new Blob([cached]));
        return response.json();
      }
      sessionStorage.removeItem(hashcode);
      sessionStorage.removeItem(`${hashcode}:timestamp`);
    }
  }

  newOptions.agent = new https.Agent({ rejectUnauthorized: false });

  return fetch(url, newOptions)
    .then(checkStatus)
    .then(response => cachedSave(response, hashcode))
    .then(response => {
      console.log(response);
      // DELETE and 204 do not return data by default
      // using .json will report an error.
      if (newOptions.method === 'DELETE' || response.status === 204) {
        return response.text();
      }
      return response.json();
    })
    .catch(e => {
      const status = e.name;
      console.log(e);
      if (status === 401) {
        // @HACK
        // eslint-disable-next-line eslint-comments/disable-enable-pair
        /* eslint-disable no-underscore-dangle */
        window.g_app._store.dispatch({
          type: 'login/logout',
        });
        router.push('/user/login');
        return;
      }

      if (status <= 504 && status >= 500) {
        router.push('/exception/500');
        return;
      }
      if (status >= 404 && status < 422) {
        router.push('/exception/404');
      }
    });
}
