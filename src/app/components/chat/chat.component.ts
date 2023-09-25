import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../../chat.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  // flags input name
  isButtonEditDisabled: boolean = true;
  isInputDisabled: boolean = false;
  notNameError: boolean = false;

  // flags create and join
  isButtonCreateJoinDisabled: boolean = false;
  isButtonCreateDisabled: boolean = false;
  isButtonJoinDisabled: boolean = false;
  isButtonJoinOKDisabled: boolean = false;
  isButtonsDisabled: boolean = true;

  // flags chat
  isChatDisabled: boolean = false;

  roomName: string = '';
  userName: string = '';
  newMessage: string = '';
  messages: Array<{ sender: string; text: string }> = [];

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    // this.chatService.onUserConnected().subscribe((data) => {
    //   console.log(data.message, data.userId);
    // });

    // this.chatService.onUserDisconnected().subscribe((data) => {
    //   console.log(data.message, data.userId);
    // });

    this.chatService.getChatMessages().subscribe((message) => {
      this.messages.push(message);
    });

    this.chatService.userLeftRoom().subscribe((message) => {
      this.messages.push({
        sender: '',
        text: message,
      });
    });

    this.chatService.userJoinedRoom().subscribe((message) => {
      this.messages.push({
        sender: '',
        text: message,
      });
    });
  }

  changeChatDisabled() {
    this.isChatDisabled = !this.isChatDisabled;
  }

  changeButtonCreateJoin() {
    this.isButtonCreateJoinDisabled = !this.isButtonCreateJoinDisabled;
  }

  editName() {
    this.changeButtonCreateJoin();
    this.isInputDisabled = !this.isInputDisabled;
    this.isButtonEditDisabled = !this.isButtonEditDisabled;
  }

  async copyToClipboard() {
    await navigator.clipboard.writeText(this.roomName);
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });

    Toast.fire({
      icon: 'success',
      title: '¡ID de sala copiado!',
    });
  }

  setUserName(userName: string) {
    if (this.userName.trim() === '') {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Por favor, establece un nombre de usuario.',
      });
      return;
    }

    this.userName = userName;

    this.editName();
  }

  createRoom() {
    this.changeChatDisabled();
    this.changeButtonCreateJoin();
    this.isButtonsDisabled = false;
    this.chatService.createRoom().subscribe((roomId) => {
      this.roomName = roomId;
    });
  }

  joinExistingRoom(roomName: string) {
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

    if (!uuidRegex.test(roomName)) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Por favor, ingrese un ID con formato valido.',
      });
      return;
    }

    if (roomName && this.userName) {
      this.chatService.joinRoom(this.roomName, this.userName);
      this.changeChatDisabled();
      this.changeButtonCreateJoin();
      this.isButtonsDisabled = false;
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Por favor, establece un nombre de usuario y elige una sala.',
      });
    }
  }

  leaveCurrentRoom() {
    if (this.roomName) {
      this.chatService.leaveRoom(this.roomName, this.userName);
      this.roomName = '';
      this.messages = [];
      this.userName = '';

      this.isButtonEditDisabled = true;
      this.isInputDisabled = false;
      this.notNameError = false;
      this.isButtonCreateJoinDisabled = false;
      this.isButtonCreateDisabled = false;
      this.isButtonJoinDisabled = false;
      this.isButtonJoinOKDisabled = false;
      this.isButtonsDisabled = true;
      this.isChatDisabled = false;
    }
  }

  sendMessage() {
    if (this.userName.trim() === '') {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Por favor, establece tu nombre primero.',
      });
      return;
    }

    if (this.newMessage.trim() === '') {
      return;
    }

    this.chatService.sendChatMessage(
      this.roomName,
      this.newMessage,
      this.userName
    );
    this.newMessage = '';
  }

  ngOnDestroy() {
    // Lógica al destruir el componente si es necesario.
  }
}
