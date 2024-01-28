/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/no-unknown-property */
/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState, ChangeEvent, FC, useContext, useRef } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Eye, EyeSlash, SmileySad } from 'phosphor-react'
import * as Yup from 'yup'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-quill/dist/quill.snow.css' // import styles
import 'react-datepicker/dist/react-datepicker.css'
import {
  changeUserWorkspaceRole,
  createWorkspace,
  inviteUserToWorkspace,
  updateWorkspace,
  updateWorkspaceLogo,
} from '@/utils/api'
import nookies, { parseCookies, destroyCookie, setCookie } from 'nookies'
import { UserWorkspaceProps } from '@/types/workspace'
import { ICPCanisterProps } from '@/types/blockchain-app'
import EditAppModal from '../Modals/EditAppModal'
import { formatDate } from '@/utils/functions'
import { optionsNetwork } from '../Modals/NewAppModal'

export interface ModalI {
  canisters: ICPCanisterProps[]
  isUserAdmin: boolean
  onUpdate(): void
}

const CanistersRender = ({ canisters, onUpdate, isUserAdmin }: ModalI) => {
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState<any>()
  const [isUserModalOpen, setIsUserModalOpen] = useState<any>()
  const [isEditInfoOpen, setIsEditInfoOpen] = useState<any>()
  const [isEditAppOpen, setIsEditAppOpen] = useState<any>()

  const { push } = useRouter()
  const pathname = usePathname()

  const menuRef = useRef(null)
  const editRef = useRef(null)
  const urlRef = useRef(null)

  const closeMenu = () => {
    setIsDeleteUserOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        // Clicked outside of the menu, so close it
        closeMenu()
      }
    }

    // Add event listener when the menu is open
    if (isDeleteUserOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      // Remove event listener when the menu is closed
      document.removeEventListener('mousedown', handleClickOutside)
    }

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDeleteUserOpen])

  function handleClickCanisters(id: string, event) {
    if (
      !editRef?.current?.contains(event.target) &&
      !urlRef?.current?.contains(event.target)
    ) {
      // push(`${pathname}/${id}`)
    }
  }

  function NoAppsFound() {
    return (
      <div className="mx-auto w-fit items-center justify-center text-[15px] font-light">
        <SmileySad size={32} className="text-blue-500 mx-auto  mb-2" />
        <span>No Canisters found, deploy your first App</span>
      </div>
    )
  }

  return (
    <div className="text-[14px] text-[#C5C4C4]">
      <div className=" text-[14px] font-normal">
        <div className="mb-[18px]">
          <div
            onClick={() => {
              // setIsCreatingNewApp(true)
            }}
            className="w-fit cursor-pointer rounded-[5px]  bg-[#273687] p-[4px] px-[15px] text-[14px] text-[#fff] hover:bg-[#35428a]"
          >
            Deploy canister
          </div>
        </div>
        <div className="grid gap-y-[25px]">
          {canisters?.length === 0 ? (
            NoAppsFound()
          ) : (
            <div className="">
              <div className="flex w-full gap-x-[5px] rounded-t-md bg-[#c5c4c40e] px-[15px] py-[8px]">
                <div className="w-full max-w-[20%]">Canister Id</div>
                <div className="w-full max-w-[38%]">URL</div>
                <div className="w-full max-w-[17%]">Type</div>
                <div className="w-full max-w-[10%]">Created at</div>
              </div>
              <div className="max-h-[calc(100vh-32rem)] overflow-y-auto  rounded-b-md border border-[#c5c4c40e] scrollbar-thin scrollbar-track-[#1D2144] scrollbar-thumb-[#c5c4c4] scrollbar-track-rounded-md scrollbar-thumb-rounded-md ">
                {' '}
                {canisters?.map((canister, index) => (
                  <div
                    onClick={(event) => {
                      handleClickCanisters(canister.id, event)
                    }}
                    key={index}
                    className={`flex items-center  ${
                      index !== canisters?.length - 1 &&
                      'border-b-[1px] border-[#c5c4c40e]'
                    } cursor-pointer gap-x-[5px] px-[15px] py-[20px] text-[15px] font-normal hover:bg-[#7775840c]`}
                  >
                    <div className="w-full max-w-[20%] overflow-hidden truncate text-ellipsis whitespace-nowrap">
                      {canister.canisterId}
                    </div>
                    <a
                      ref={urlRef}
                      href={canister.url}
                      target="_blank"
                      className="w-full max-w-[38%]"
                      rel="noreferrer"
                    >
                      <div className="flex w-full items-center gap-x-[7px] hover:text-[#0354EC]">
                        {canister.url}
                      </div>
                    </a>

                    <div className="flex w-full max-w-[17%] items-center gap-x-[7px]">
                      {canister.type}
                    </div>
                    <div className="w-full max-w-[10%] overflow-hidden truncate text-ellipsis whitespace-nowrap">
                      {formatDate(canister.createdAt)}
                    </div>
                    <div className="ml-auto w-full max-w-[5%]">
                      {' '}
                      {isEditInfoOpen === canister.id && (
                        <div className="absolute flex w-fit -translate-x-[50%]   -translate-y-[100%]   items-center rounded-[6px]  bg-[#060621]  px-[10px] py-[5px] text-center">
                          Edit canister
                        </div>
                      )}
                      {isUserAdmin && (
                        <img
                          alt="ethereum avatar"
                          src="/images/chat/pencil.svg"
                          className="w-[15px] cursor-pointer 2xl:w-[25px]"
                          onMouseEnter={() => setIsEditInfoOpen(canister.id)}
                          onMouseLeave={() => setIsEditInfoOpen(null)}
                          onClick={() => {
                            setIsEditAppOpen(canister.id)
                          }}
                        ></img>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* {isEditAppOpen && (
        <EditAppModal
          ref={editRef}
          isOpen={isEditAppOpen}
          onClose={() => {
            setIsEditAppOpen(false)
          }}
          onUpdateM={() => {
            onUpdate()
            setIsEditAppOpen(false)
          }}
          app={canisters.find((app) => app.id === isEditAppOpen)}
        />
      )} */}
    </div>
  )
}

export default CanistersRender