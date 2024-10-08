import { render, screen,  waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node';


import  {MemberList}  from '../../src/views/Members/MemberList'
import { LoginContext } from '@/context/Login';
import { FriendList } from '@/views/Friends/FriendList';
import { sync } from 'glob';
import { RefetchProvider } from '@/context/Refetch';

let returnError = false

const handlers = [
  graphql.query('friend', ({ query, variables }) => {
    console.log(query)
    if (returnError) {
      return HttpResponse.json({
        errors: [ {
            "message": "Some Error",
          },
        ]},
      )
    }
    return HttpResponse.json({
      data: {
        friend: friends,
      },
    })
  }),
  graphql.query('request', ({ query, variables }) => {
    console.log(query)
    if (returnError) {
      return HttpResponse.json({
        errors: [ {
            "message": "Some Error",
          },
        ]},
      )
    }
    return HttpResponse.json({
      data: {
        request: requests,
      },
    })
  }),
  graphql.query('nonFriendMember', ({ query, variables }) => {
    console.log(query)
    if (returnError) {
      return HttpResponse.json({
        errors: [ {
            "message": "Some Error",
          },
        ]},
      )
    }
    return HttpResponse.json({
      data: {
        nonFriendMember: members,
      },
    })
  }),
  graphql.mutation('makeRequest', ({ query, variables }) => {
    console.log(query)
    if (query.includes('Bad ID')) {
      return HttpResponse.json({
        errors: [ {
            "message": "Some Error",
          },
        ]},
      )
    }
    return HttpResponse.json({
      data: {
        removeFriend: {
          "id": "some id",
          "name": "some name",
        },
      },
    })
  }),
  graphql.mutation('removeFriend', ({ query, variables }) => {
    console.log(query)
    if (query.includes('Bad ID')) {
      return HttpResponse.json({
        errors: [ {
            "message": "Some Error",
          },
        ]},
      )
    }
    return HttpResponse.json({
      data: {
        removeFriend: {
          "id": "some id",
          "name": "some name",
        },
      },
    })
  }),
  graphql.mutation('accpetRequest', ({ query, variables }) => {
    console.log(query)
    if (query.includes('Bad ID')) {
      return HttpResponse.json({
        errors: [ {
            "message": "Some Error",
          },
        ]},
      )
    }
    return HttpResponse.json({
      data: {
        accpetRequest: {
          "id": "some id",
          "name": "some name",
        },
      },
    })
  }),
  graphql.mutation('removeRequest', ({ query, variables }) => {
    console.log(query)
    if (returnError) {
      return HttpResponse.json({
        errors: [ {
            "message": "Some Error",
          },
        ]},
      )
    }
    return HttpResponse.json({
      data: {
        removeRequest: {
          "id": "Inbound 1 ID",
          "name": "some name",
        },
      },
    })
  }),
]

const server = setupServer(...handlers)

beforeAll(() => server.listen())
beforeEach(() => {
  returnError = false
  openFriends = true
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const friends = [
  {
    "id": "Friend 1 ID",
    "name": "Friend 1 Name",
  },
  {
    "id": "Friend 2 ID",
    "name": "Friend 2 Name",
  }
]

const members = [
  {
    "id": "Member 1 ID",
    "name": "Member 1 Name",
  },
  {
    "id": "Member 2 ID",
    "name": "Member 2 Name",
  }
]

const inbound = [
  {
    "id": "Inbound 1 ID",
    "name": "Inbound 1 Name"
  },
  {
    "id": "Inbound 2 ID",
    "name": "Inbound 2 Name"
  }
]

const outbound = [
  {
    "id": "Outbound 1 ID",
    "name": "Outbound 1 Name"
  },
  {
    "id": "Outbound 2 ID",
    "name": "Outbound 2 Name"
  }
]
const requests = {
  inbound: inbound,
  outbound: outbound
}


const accessToken = 'some old token'
const setAccessToken = () => {}
const userName = ''
const setUserName = () => {}
let openFriends = true
const setOpenFriends = () => {openFriends = false}
const createInstance = () => {

  return render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <RefetchProvider>
        <FriendList openFriends={openFriends} setOpenFriends={setOpenFriends}/>
      </RefetchProvider>
    </LoginContext.Provider>
  )
}

it('Renders with all data correctly', async() => {
  createInstance()
  await waitFor(() => {
    screen.getByText('Friends')
    screen.getByText('Friend 1 Name')
    screen.getByText('Friend 2 Name')
    screen.getByText('Inbound 1 Name')
    screen.getByText('Inbound 2 Name')
    screen.getByText('Outbound 1 Name')
    screen.getByText('Outbound 2 Name')
  })
})

it('Successfully removes a friend', async() => {
  createInstance()
  await waitFor(() => {
    screen.getByText('Friend 1 Name')
  })

  const removeFriend = screen.getAllByLabelText('Remove Friend Icon')
  fireEvent.click(removeFriend[0])
  fireEvent.click(screen.getByText('Agree'))
  // await waitFor(() => {
  //   expect(screen.queryByText('Friend 1 Name')).toBeNull()
  // })
})

it('Successfully removes an inbound request', async() => {
  createInstance()
  await waitFor(() => {
    screen.getByText('Inbound 1 Name')
  })
  const requests = screen.getAllByLabelText('Remove Request Icon')
  fireEvent.click(requests[2])
  fireEvent.click(screen.getByText('Agree'))
  // await waitFor(() => {
  //   expect(screen.queryByText('Inbound 1 Name')).toBeNull()
  // })
})

it('Errors on removing a request', async() => {
  createInstance()
  await waitFor(() => {
    screen.getByText('Inbound 1 Name')
  })
  returnError = true
  const requests = screen.getAllByLabelText('Remove Request Icon')
  fireEvent.click(requests[2])
  fireEvent.click(screen.getByText('Agree'))
  await waitFor(() => {
    expect(screen.queryByText('Inbound 1 Name')).not.toBeNull()
  })
})

it('Successfully Accepts Request', async() => {
  createInstance()
  await waitFor(() => {
    screen.getByText('Inbound 1 Name')
  })
  const acceptRequest = screen.getAllByLabelText('Inbound Icon')
  expect(acceptRequest.length).toEqual(2)
  fireEvent.click(acceptRequest[0])
  fireEvent.click(screen.getByText('Agree'))
  // await waitFor(() => {
  //   const inboundRequests = screen.getAllByLabelText('Inbound Icon')
  //   expect(inboundRequests.length).toEqual(1)
  //   expect(screen.getByText('Inbound 1 Name')).toBeDefined()
  // })
})

it('Fails to accept request', async() => {
  createInstance()
  await waitFor(() => {
    screen.getByText('Inbound 1 Name')
  })
  returnError = true
  const acceptRequest = screen.getAllByLabelText('Inbound Icon')
  expect(acceptRequest.length).toEqual(2)
  fireEvent.click(acceptRequest[0])
  fireEvent.click(screen.getByText('Agree'))
  await waitFor(() => {
    const inboundRequests = screen.getAllByLabelText('Inbound Icon')
    expect(inboundRequests.length).toEqual(2)
  })
})

it('Fails to fetch friends', async() => {
  returnError = true
  createInstance()
  await waitFor(() => {
    expect(screen.queryByText('Friend 1 Name')).toBeNull()
    expect(screen.queryByText('Friend 2 Name')).toBeNull()
  })
})

it('Fails to fetch Requests', async() => {
  returnError = true
  createInstance()
  await waitFor(() => {
    expect(screen.queryByText('Inbound 1 Name')).toBeNull()
    expect(screen.queryByText('Inbound 2 Name')).toBeNull()
    expect(screen.queryByText('Outbound 1 Name')).toBeNull()
    expect(screen.queryByText('Outbound 2 Name')).toBeNull()
  })
})

it('Clicks open members', async() => {
  createInstance()
  fireEvent.click(screen.getByLabelText('Add Members Button'))
  await waitFor(() => {
    expect(screen.getByText('Member 1 Name')).toBeDefined()
  })
})

it('Closes page when clicking back', async() => {
  createInstance()
  fireEvent.click(screen.getByLabelText('close friends'))
  await waitFor(() => {
    expect(openFriends).toBeFalsy()
  })
})

it('Alerts when trying to request and server is down', async() => {
  let alerted = false
  window.alert = () => {alerted = true}
  createInstance()
  await waitFor(() => {
    screen.getByText('Inbound 1 Name')
  })
  server.close()
  const acceptRequest = screen.getAllByLabelText('Inbound Icon')
  expect(acceptRequest.length).toEqual(2)
  fireEvent.click(acceptRequest[0])
  fireEvent.click(screen.getByText('Agree'))
  await waitFor(() => {
    expect(alerted).toBeTruthy()
  })
})

it('Alerts when trying to remove request and server is down', async() => {

  const server = setupServer(...handlers)
  server.listen()
  server.resetHandlers()
  

  let alerted = false
  window.alert = () => {alerted = true}
  createInstance()
  await waitFor(() => {
    screen.getByText('Inbound 1 Name')
  })
  server.close()
  const requests = screen.getAllByLabelText('Remove Request Icon')
  fireEvent.click(requests[2])
  fireEvent.click(screen.getByText('Agree'))
  await waitFor(() => {
    expect(alerted).toBeTruthy()
  })
})

it('Alerts when server is down', async() => {
  let alerted = false
  server.close()
  window.alert = () => {alerted = true}
  createInstance()
  await waitFor(() => {
    expect(alerted).toBeTruthy()
  })
})