# Cookies

By deafult the http is stateless. But with the help of the cookie we can make it statefulll.

During the initial localhost:3000 we give the cookie to the browser.
Then everytimes while it request anything from the browswer it will pass the cookie. With the help of cookie we check if the user was same or not. So, it can help with authentication

# Changes in the code
i-> App.js( changed code to pass the signed cookie named hello world)
ii-> Product.js(Changed the code such that only if the cookie matched then only send the response)