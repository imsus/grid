class Grid {
	constructor(elem, output) {
		this.elem = document.getElementById(elem);
		this.output = document.getElementById(output);

		this.regions = [
			['.', '.'],
			['.', '.']
		];
		this.regionColors = [
			[null, null],
			[null, null]
		];
		this.rows = ['1fr', '1fr'];
		this.cols = ['1fr', '1fr'];
	}

	addRow() {
		this.regions.push(new Array(this.cols.length).fill('.'));
		this.regionColors.push(new Array(this.cols.length).fill(null));
		this.rows.push('1fr');
		this.render();
	}
	remRow() {
		if(this.rows.length == 1) return;
		this.regions.pop();
		this.regionColors.pop();
		this.rows.pop();
		this.render();
	}
	addCol() {
		this.regions.forEach(arr => arr.push('.'));
		this.regionColors.forEach(arr => arr.push(null));
		this.cols.push('1fr');
		this.render();
	}
	remCol() {
		if(this.cols.length == 1) return;
		this.regions.forEach(arr => arr.pop());
		this.regionColors.forEach(arr => arr.pop());
		this.cols.pop();
		this.render();
	}

	_formatRow(i) {
		return "' " + this.regions[i].join(' ') + " ' " + this.rows[i];
	}

	format() {
		let formatted = 'grid-template:\n';
		for(const i in this.rows)
			formatted += '    ' + this._formatRow(i) + '\n';

		return formatted += '    / ' + this.cols.join(' ') + ';';
	}

	_getCSSvar(variable) {
		return window.getComputedStyle(this.elem).getPropertyValue('--' + variable);
	}
	_setCSSvar(variable, value) {
		this.elem.style.setProperty('--' + variable, value);
	}

	_updateVal(axis, index, value) {
		this[axis][index] = value;
		this._setCSSvar(axis, this[axis].join(' '));
	}

	update(elem) {
		if(!elem) {
			this._setCSSvar('rows', this.rows.join(' '));
			this._setCSSvar('cols', this.cols.join(' '));
		}
		else {
			const id = elem.id;
			const [axis, index] = id.split('-');
			const val = elem.value;

			this._updateVal(axis, index-1, val);
		}
		this.output.innerHTML = this.format();
	}

	render() {
		this.elem.innerHTML = '';

		for(let row=0; row<=this.rows.length; row++) {
			for(let col=0; col<=this.cols.length; col++) {
				const noborder = row == 0 || col == 0;
				const elem = document.createElement('div');

				if(row == 0) {
					if(noborder)
						elem.className = 'input';

					if(col == 0) {  // empty square in top left
						this.elem.appendChild(elem);
						continue;
					}

					const input = document.createElement('input');
					input.addEventListener('blur', () => this.update(input) );
					input.setAttribute('id', 'cols-' + col);
					const val = this.cols[col] == '' ? '1fr' : this.cols[col-1];
					input.setAttribute('value', val);

					elem.appendChild(input);
				}
				else {
					if(col == 0) {
						if(noborder)
							elem.className = 'input';

						const input = document.createElement('input');
						input.addEventListener('blur', () => this.update(input) );
						input.setAttribute('id', 'rows-' + row);
						const val = this.rows[row] == '' ? '1fr' : this.rows[row-1];
						input.setAttribute('value', val);
						elem.appendChild(input);
					}
					else {
						elem.setAttribute('data-cell', row + ',' + col);
						elem.innerHTML = this.regions[row-1][col-1] == '.' ? '' : this.regions[row-1][col-1];
						elem.style.background = this.regionColors[row-1][col-1] == null ? '' : this.regionColors[row-1][col-1];

						if(row == 1)
							elem.style['border-top-width'] = '2px';
						if(col == 1)
							elem.style['border-left-width'] = '2px';
						if(row == this.rows.length)
							elem.style['border-bottom-width'] = '2px';
						if(col == this.cols.length)
							elem.style['border-right-width'] = '2px';
					}
				}
				this.elem.appendChild(elem);
			}
		}
		this.update();
		this.output.innerHTML = this.format();

		return this;
	}

	_getCell() {
		return new Promise(resolve => {
			this.elem.addEventListener('click', e => {
				const loc = e.target.getAttribute('data-cell');
				if(loc !== null) {
					resolve(loc.split(','));
				}
			});
		});
	}

	async addRegion() {
		const name = prompt('Name of region');
		const color = prompt('Enter a valid CSS color');

		alert('Click the top left corner, then bottom right corner of the area');
		document.getElementById('messages').innerHTML = 'Click the <em>top left</em> corner of the area';
		const topLeft = await this._getCell();

		document.getElementById('messages').innerHTML = 'Click the <em>bottom right</em> corner of the area';
		const bottomRight = await this._getCell();

		document.getElementById('messages').innerHTML = '';

		for(let x=topLeft[0]; x<=bottomRight[0]; x++)
			for(let y=topLeft[1]; y<=bottomRight[1]; y++) {
				this.regions[x-1][y-1] = name;
				this.regionColors[x-1][y-1] = color;
			}
		this.render();
	}
}
