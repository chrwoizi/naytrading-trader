import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ConfigKey } from '../ConfigKey';
import { ErrorResponse } from './ErrorResponse';
import { HasNewerSuggestionResponse } from './HasNewerSuggestionResponse';
import { IdResponse } from './IdResponse';
import { LoginResponse } from './LoginResponse';
import { Suggestion } from './Suggestion';

export class NaytradingService {
  private naytradingUrl: string;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService
  ) {
    this.naytradingUrl = this.configService.get<string>(
      ConfigKey.NAYTRADING_URL
    );
  }

  async login(userName: string, password: string): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>(
      this.naytradingUrl + '/api/login',
      {
        email: userName,
        password: password
      }
    );
    if (response && response.token && response.token.length) {
      return response;
    } else {
      throw new Error('Error while signing in');
    }
  }

  async setInstrumentWeight(
    isinOrWkn: string,
    type: string,
    weight: string,
    jwt: string
  ) {
    console.log(
      'Setting weight ' +
        type +
        ' of instrument ' +
        isinOrWkn +
        ' to ' +
        weight +
        ' at naytrading...'
    );
    try {
      const response = await this.post<any>(
        this.naytradingUrl +
          '/api/weight/' +
          isinOrWkn +
          '/' +
          type +
          '/' +
          weight,
        {},
        jwt
      );
      if (response && JSON.stringify(response) == '{}') {
        console.log('Weight is set.');
      } else {
        throw new Error(
          response ? JSON.stringify(response) : '[empty response]'
        );
      }
    } catch (error) {
      console.log(
        'Error while setting instrument weight: ' +
          error.message +
          '\n' +
          error.stack
      );
      throw error;
    }
  }

  async getOpenSuggestions(jwt: string) {
    try {
      const response = await this.get<Suggestion[]>(
        this.naytradingUrl + '/api/trader/suggestions',
        jwt
      );
      if (response && response.length >= 0) {
        return response;
      } else {
        throw new Error(
          response ? JSON.stringify(response) : '[empty response]'
        );
      }
    } catch (error) {
      console.log(
        'Error while loading open suggestions: ' +
          error.message +
          '\n' +
          error.stack
      );
      throw error;
    }
  }

  async hasNewerSuggestion(suggestionId: string, jwt: string) {
    try {
      const response = await this.get<HasNewerSuggestionResponse>(
        this.naytradingUrl +
          '/api/trader/suggestion/' +
          suggestionId +
          '/newer',
        jwt
      );
      if (response && typeof response.hasNewerSuggestion !== 'undefined') {
        return response.hasNewerSuggestion;
      } else {
        throw new Error(
          response ? JSON.stringify(response) : '[empty response]'
        );
      }
    } catch (error) {
      console.log(
        'Error while checking for newer suggestion: ' +
          error.message +
          '\n' +
          error.stack
      );
      throw error;
    }
  }

  async saveTradeLog(log: string, jwt: string) {
    try {
      const response = await this.post<IdResponse>(
        this.naytradingUrl + '/api/trader/log',
        log,
        jwt
      );
      if (response && response.ID >= 0) {
        return response.ID;
      } else {
        throw new Error(
          response ? JSON.stringify(response) : '[empty response]'
        );
      }
    } catch (error) {
      console.log(
        'Error while saving log for suggestion: ' +
          error.message +
          '\n' +
          error.stack
      );
      throw error;
    }
  }

  private async get<TResponse>(url: string, jwt?: string): Promise<TResponse> {
    let headers = {};
    if (jwt) {
      headers = { Authorization: 'Bearer ' + jwt };
    }

    try {
      const response = await axios({
        url: url,
        method: 'GET',
        headers: headers
      });
      if (!response) {
        throw new Error('unknown error');
      } else if (response.status != 200) {
        throw new Error('HTTP ' + response.status);
      } else if ((response.data as ErrorResponse).error) {
        throw new Error((response.data as ErrorResponse).error);
      } else return response.data as TResponse;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  private async post<TResponse>(
    url: string,
    data: any,
    jwt?: string
  ): Promise<TResponse> {
    let headers = {};
    if (jwt) {
      headers = { Authorization: 'Bearer ' + jwt };
    }

    try {
      const response = await axios({
        url: url,
        method: 'POST',
        data: data,
        headers: headers
      });
      if (!response) {
        throw new Error('unknown error');
      } else if (response.status != 200) {
        throw new Error('HTTP ' + response.status);
      } else if ((response.data as ErrorResponse).error) {
        throw new Error((response.data as ErrorResponse).error);
      } else return response.data as TResponse;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
