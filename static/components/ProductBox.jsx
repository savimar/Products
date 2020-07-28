import * as React from 'react'
import Breadcrumb from './Breadcrumb'
import { HashRouter } from 'react-router-dom'


let path

export default class Products extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      products: [],
      beforeTitle:'',
      item: {
        title: 'Товар',
        descriptionFull: 'Описание',
        key: 1,
        slug: 'bag'
      }
    }
    this.getPath()
  }

  getPath () {
    if (this.props.prodKey !== undefined && this.props.prodKey !== null) {
      path = '/api/product?key=' + this.props.prodKey
    } else if (this.props.prodId !== undefined && this.props.prodId !== null) {
      path = '/api/product?id=' + this.props.prodId
    } else {
      path = '/api/product?slag=bag'
    }

  }

  getProducts (products) {
    return (
      <React.Fragment>
        {products && products.length ? (
          products.map((item, index) => (
              <React.Fragment key={index}>
                <h5 className="card-title">{item.title}</h5>
                <img className="card-img-top" src={item.img} alt="img"></img>
                <p className="card-text">{item.descriptionFull}</p>
                <p className="card-text"> Цена {item.price} руб.</p>
                <a href="#" className="btn btn-primary">Купить</a>
              </React.Fragment>
            )
          )) : (
          <div>
            <h4>Идет поиск товара</h4>
          </div>
        )
        }
      </React.Fragment>
    )
  }

  onSave (event) {
    event.preventDefault();
    event.stopPropagation();
    console.log(this.state.item);
    fetch(`/api/product/${this.props.prodId}`, {
      method: "put",
      body: JSON.stringify(this.state.item),
      headers: {
        "Content-Type": "application/json"
      }
    }).then( res => res.json())
      /*.then(prod => this.setState(() => ({
        item: prod
      })))*/
      .catch(error => {
        console.error(error)
      })

  }

  onChange (event) {

    event.preventDefault()
    event.stopPropagation()
    const name = event.target.name
    switch (name) {
      case 'title':
        this.state.item.title = event.target.value;
        break
      case 'descriptionFull':
        this.state.item.descriptionFull = event.target.value
        break
      case 'key' :
        this.state.item.key = event.target.value
        break
      case 'slug' :
        this.state.item.slug = event.target.value
        break
      default :
        break
    }

    this.forceUpdate()
  }

  renderForm (products) {
    return (
      <React.Fragment>
        {products && products.length ? (
          products.map((item, index) => (
            <HashRouter>
              <React.Fragment key={index}>
                <form>
                  <div className="form-group">
                    <p><label htmlFor="formGroupExampleInput">{item.title}</label></p>
                    <p> <label htmlFor="formGroupExampleInput">Введите новое наименование товара</label></p>
                    <input  placeholder={item.title} name="title" type="text" className="form-control"
                           id="title"
                           value={this.state.item.title}
                           onChange={this.onChange.bind(this)}></input>
                  </div>
                  <h5 className="card-title">{this.state.item.title}</h5>
                   <img className="card-img-top" src={item.img} alt="img"></img>
                  <div className="form-group">
                   <p> <label htmlFor="exampleFormControlTextarea1">Введите новое полное описание товара</label></p>
                    <textarea placeholder={item.descriptionFull}
                              name="descriptionFull" className="form-control"
                              id="descriptionFull"
                              rows="3"
                              value={this.state.item.descriptionFull}
                              onChange={this.onChange.bind(this)}></textarea>
                  </div>
                   <p className="card-text"> Цена {item.price} руб.</p>
                  <div className="form-group">
                    <p><label htmlFor="formGroupExampleInput">Введите числовой ключ товара</label></p>
                    <input placeholder={item.key} name="key" type="text" className="form-control"
                           id="key"
                           value={this.state.item.key}
                           onChange={this.onChange.bind(this)}></input>
                  </div>
                    <div className="form-group">
                    <label htmlFor="formGroupExampleInput">Введите ключевое наименование товара</label>
                    <input  placeholder={item.slug} name="slug" type="text" className="form-control"
                           id="slug"
                           value={this.state.item.slug}
                           onChange={this.onChange.bind(this)}></input>
                  </div>
                  <p><a href="#" className="btn btn-primary">Купить</a></p>
                  <p><button onClick={this.onSave.bind(this)} type="button" className="btn btn-success">Сохранить</button></p>
                </form>
              </React.Fragment>
            </HashRouter>)
          )) : (
          <div>
            <h4>Идет поиск товара</h4>
          </div>
        )
        }
      </React.Fragment>
    )
  }

  renderProduct () {
    return (
      fetch(path)
        .then(res => res.json())
        .then(product => this.setState(() => ({
          products: product
        })))
        .catch(error => {
          console.error(error)
        })
    )

  }

  componentDidMount () {
    this.renderProduct()
  }

  render () {
    const { products } = this.state
    return (
      <main>
        <div className="container">
          <div className="box">
            <div className="content">
              <Breadcrumb/>
              {this.props.isEdit ? (
                this.renderForm(products)
              ) : (
                this.getProducts(products)
              )}
            </div>
          </div>
        </div>
      </main>
    )
  }

}




