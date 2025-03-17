import { Component , OnInit ,AfterViewInit , AfterViewChecked , ElementRef , ViewChild} from '@angular/core';
import {DrawingService}from './services/drawing.service';
interface Card {
  value: string;
  id: number;
  flipped: boolean;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit , AfterViewChecked {
	title = 'Memory card Game';
	cards: Card[] = [];
	flippedCards: Card[] = [];
	moves: number = 0;
	gameWon: boolean = false;
	@ViewChild('drawingCanvas') canvas!: ElementRef<HTMLCanvasElement>;
	private canvasInitialized = false;

	constructor(private drawingService: DrawingService) {}
	ngAfterViewChecked(){
		if (this.gameWon && !this.canvasInitialized && this.canvas?.nativeElement) {
		this.drawingService.initCanvas(this.canvas.nativeElement);
		this.canvasInitialized = true; // Prevents redundant initialization
		}
	}

	ngOnInit() {
		this.initializeGame();
	}
	initializeGame() {
		this.cards = this.shuffleCards([
		{ value: '4.png', id: 1, flipped: false }, { value: '4.png', id: 2, flipped: false },
		{ value: '5.png', id: 3, flipped: false }, { value: '5.png', id: 4, flipped: false },
		{ value: '6.png', id: 5, flipped: false }, { value: '6.png', id: 6, flipped: false },
		{ value: '7.png', id: 7, flipped: false }, { value: '7.png', id: 8, flipped: false },
		{ value: '12.png', id: 9, flipped: false }, { value: '12.png', id: 10, flipped: false },
		{ value: '13.png', id: 11, flipped: false }, { value: '13.png', id: 12, flipped: false },
		]);
		this.flippedCards = [];
		this.moves = 0;
		this.gameWon = false;
		this.canvasInitialized = false;
	}
	shuffleCards(cards: Card[]): Card[] {
		return cards.sort(() => Math.random() - 0.5);
	}
	
	// Handle card flip logic
	onCardClick(card: Card) {
		if (!card.flipped) {
			card.flipped = true;
			this.flippedCards.push(card);
			this.moves++;
	
			if (this.flippedCards.length === 2) {
				this.checkMatch();
			}
		}
	}
	checkMatch() {
		const [firstCard, secondCard] = this.flippedCards;
		if (firstCard.value === secondCard.value) {
		// Cards match
			if (this.cards.every(card => card.flipped)) {
				this.gameWon = true; // All cards matched
			}
			
		} else {
		// Cards don't match, flip them back after a short delay
		setTimeout(() => {
			firstCard.flipped = false;
			secondCard.flipped = false;
		}, 1000);
		}
		this.flippedCards = [];
	}

}
