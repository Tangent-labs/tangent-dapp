/* eslint-disable @next/next/no-img-element */
"use client"

import Panel from "../design_system/structure/panel"
import ExampleTitle from "./example_title"

const Filler = ({ height }: { height: number }) => {
  return (
    <div>
      <div>A photo</div>
      <img src={`https://picsum.photos/400/${height}`} alt="filler" className="grayscale" />
    </div>
  )
}

export default function ExamplePanelDisposition() {
  return (
    <>
      <ExampleTitle title="Panel Disposition" />

      <div className="flex flex-col gap-2">
        <div className="flex gap-3">
          <div className="flex max-lg:flex-col w-full gap-3">
            <Panel className="lg:w-1/3">
              <Filler height={200} />
            </Panel>
            <Panel className="lg:w-2/3">
              <Filler height={300} />
            </Panel>
          </div>
        </div>
        <div className="flex gap-3 ">
          <div className="flex w-full gap-3  max-lg:flex-col">
            <Panel className="lg:w-1/2">
              <Filler height={100} />
            </Panel>
            <Panel className="lg:w-1/2">
              <Filler height={350} />
            </Panel>
          </div>
        </div>
      </div>
    </>
  )
}
