import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket: any;

  constructor() {
    this.socket = io('http://localhost:3000');
  }

  public createRoom(): Observable<string> {
    this.socket.emit('createRoom');
    return new Observable((observer) => {
      this.socket.on('roomCreated', (roomId: string) => {
        observer.next(roomId);
      });
    });
  }

  public joinRoom(roomId: string, userName: string) {
    this.socket.emit('joinRoom', { roomId, userName });
  }

  public sendChatMessage(roomId: string, message: string, sender: string) {
    this.socket.emit('sendMessage', { roomId, message, sender });
  }

  public leaveRoom(roomName: string, nameUser: string) {
    this.socket.emit('leaveRoom', {roomName, nameUser});
  }

  public userJoinedRoom(): Observable<string> {
    return new Observable((observer) => {
      this.socket.on('userJoinedRoom', (message: string) => {
        observer.next(message);
      });
    });
  }

  public userLeftRoom(): Observable<string> {
    return new Observable((observer) => {
      this.socket.on('userLeftRoom', (message: string) => {
        observer.next(message);
      });
    });
  }

  public onUserConnected(): Observable<{ userId: string; message: string }> {
    return new Observable((observer) => {
      this.socket.on(
        'userConnected',
        (data: { userId: string; message: string }) => {
          observer.next(data);
        }
      );
    });
  }

  public onUserDisconnected(): Observable<{ userId: string; message: string }> {
    return new Observable((observer) => {
      this.socket.on(
        'userDisconnected',
        (data: { userId: string; message: string }) => {
          observer.next(data);
        }
      );
    });
  }

  public getChatMessages(): Observable<{
    sender: string;
    text: string;
    from: string;
  }> {
    return new Observable((observer) => {
      this.socket.on(
        'receiveMessage',
        (message: { sender: string; text: string; from: string }) => {
          observer.next(message);
        }
      );
    });
  }
}
