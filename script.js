class App extends React.Component {
  constructor() {
    super();
    this.state = {
      contacts: [],
    };
    this.handleContactDelete = this.handleContactDelete.bind(this);
    this.handleContactsUpdate = this.handleContactsUpdate.bind(this);
  }

  handleContactDelete(id) {
    this.setState({
      contacts: this.state.contacts.filter(contact => contact.id !== id),
    });
  }

  handleContactsUpdate(contact) {
    const newId = Math.max.apply(Math,this.state.contacts.map(function(o){return o.id;})) + 1;
    const newContact = {
      id: newId,
      firstName: contact.firstName,
      lastName: contact.lastName,
      phone: contact.phone
    }
    this.setState(previousState => ({
      contacts: [...previousState.contacts, newContact]
    }));
  }

  componentDidMount() {
    fetch("http://localhost:3000/list")
      .then(res => res.json())
      .then(res => this.setState({contacts: res.contacts}));
  }

  render() {
    return (
      <div>
        <h1>Phone Book</h1>
        <ContactsTable contacts={this.state.contacts} handleContactDelete={this.handleContactDelete} />
      <NewContactForm handleContactsUpdate={this.handleContactsUpdate} />
      </div>
    );
  }
}

class NewContactForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      firstNameValid: true,
      lastName: '',
      lastNameValid: true,
      phone: '',
      phoneValid: true
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFirstNameChange = this.handleFirstNameChange.bind(this);
    this.handleLastNameChange = this.handleLastNameChange.bind(this);
    this.handlePhoneChange = this.handlePhoneChange.bind(this);
  }

  handleSubmit(e) {
    //e.preventDefault();
    //console.log("submit clicked");
    const key = this.props.handleContactsUpdate(this.state);
    const params = {
      id: key,
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      phone: this.state.phone
    };

    // to jest odwrotność tej metody do dekodowania parametrów w javie
    const encodedParams = Object.keys(params).map((key) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    }).join('&');

    // to już jest request
    fetch("http://localhost:3000/add?" + encodedParams, {
      method: 'GET', // to jest złe ale prostsze
    }).then(response => "success")
    .catch(error => "there was a problem")
  }

  upCaseFirst(line) {
    if (line.length > 0) return line[0].toUpperCase() + line.slice(1);
    else return '';
  }

  handleFirstNameChange(e) {
    this.setState({ firstName: this.upCaseFirst(e.target.value) });
    if (e.target.value.length == 0) this.setState({firstNameValid: false});
    else this.setState({firstNameValid: true});
  }

  handleLastNameChange(e) {
    this.setState({ lastName: e.target.value });
  }

  handlePhoneChange(e) {
    this.setState({ phone: e.target.value });
  }

  render() {
    let firstNameClass = 'form-control';
    let firstNameWarning = '';
    if (!(this.state.firstNameValid)) {
      firstNameClass = firstNameClass + ' is-invalid';
      firstNameWarning = <div className="invalid-feedback">Field cannot be empty.</div>;
    }
    return (
      <form onSubmit={this.handleSubmit}>
        <p>Add new contact:</p>
        <div className="form-row">
          <div className="form-group col-md-4">
            <label>First Name</label>
            <input type="text" className={firstNameClass} aria-describedby="emailHelp" placeholder="First Name" value={this.state.firstName} onChange={this.handleFirstNameChange} />
            {firstNameWarning}
          </div>
          <div className="form-group col-md-4">
            <label>Last Name</label>
          <input type="text" className="form-control" placeholder="Last Name" value={this.state.lastName} onChange={this.handleLastNameChange} />
          </div>
          <div className="form-group col-md-4">
            <label>Phone Number</label>
          <input type="text" className="form-control" placeholder="Telephone" value={this.state.phone} onChange={this.handlePhoneChange} />
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    );
  }
}

class ContactsTable extends React.Component {
  render() {
    return (
      <table className="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">First</th>
            <th scope="col">Last</th>
            <th scope="col">Phone</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {this.props.contacts.map((contact, index) =>
            <ContactsRow key={contact.id} contact={contact} index={index} handleContactDelete={this.props.handleContactDelete} />)}
        </tbody>
      </table>
    );
  }
}

class ContactsRow extends React.Component {
  handleDelete() {
    this.props.handleContactDelete(this.props.contact.id);
  }

  render() {
    return (
      <tr>
        <td>{this.props.index+1}.</td>
        <td>{this.props.contact.firstName}</td>
        <td>{this.props.contact.lastName}</td>
        <td>{this.props.contact.phone}</td>
        <td><button className="btn btn-danger" onClick={this.handleDelete.bind(this)}>Usuń</button></td>
      </tr>
    );
  }
}

ReactDOM.render(
  <App/>,
  document.getElementById('root')
);
